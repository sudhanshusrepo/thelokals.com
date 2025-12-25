import React from 'react';
import { StyleSheet, View, Platform, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

interface UnicornAnimatedViewProps {
    style?: ViewStyle;
    mini?: boolean;
    projectId?: string;
    onPress?: () => void;
}

const PROJECT_ID = "xg65TpkJ5OixVwr7EbBU";

export const UnicornAnimatedView: React.FC<UnicornAnimatedViewProps> = ({
    style,
    mini = false,
    projectId = PROJECT_ID,
    onPress
}) => {

    const fullHTML = `
<!DOCTYPE html> 
<html> 
<head> 
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<script src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.3/dist/unicornStudio.umd.js"></script> 
<style>
  body,html{margin:0;padding:0;height:100%;overflow:hidden;background:transparent;}
  #us-container { width: 100%; height: 100%; }
</style> 
</head> 
<body> 
<div id="us-container" 
     data-us-project="${projectId}?production=true" 
     data-us-scale="0.8" 
     data-us-dpi="1.2" 
     data-us-fps="30"> 
</div> 
</body> 
</html>`;

    const miniHTML = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<script src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.5.3/dist/unicornStudio.umd.js"></script>
<style>body,html{margin:0;padding:0;height:100%;overflow:hidden;background:transparent;}</style>
</head>
<body style="margin:0;height:100%;width:100%">
  <div id="us-mini" 
       data-us-project="${projectId}" 
       data-us-scale="0.3" 
       data-us-fps="15" 
       style="width:100%;height:100%">
  </div>
</body>
</html>`;

    const htmlContent = mini ? miniHTML : fullHTML;

    return (
        <View style={[styles.container, style]}>
            <WebView
                source={{ html: htmlContent }}
                style={{ backgroundColor: 'transparent' }}
                scrollEnabled={false}
                javaScriptEnabled={true}
                scalesPageToFit={false}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                originWhitelist={['*']}
                onTouchEnd={onPress}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
    }
});
